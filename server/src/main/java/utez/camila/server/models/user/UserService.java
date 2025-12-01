package utez.camila.server.models.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.camila.server.config.CustomResponse;
import utez.camila.server.models.helpers.Rol;
import utez.camila.server.models.room.Room;
import utez.camila.server.models.room.RoomRepository;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    private final CustomResponse customResponse;

    private final RoomRepository roomRepository;

    public UserService(UserRepository userRepository, CustomResponse customResponse, RoomRepository roomRepository) {
        this.userRepository = userRepository;
        this.customResponse = customResponse;
        this.roomRepository = roomRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> findAllUsers() {
        return customResponse.getJSONResponse(userRepository.findAll());
    }
/*
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> saveUser(User user) {
        try{
            Rol rol = Rol.fromString(user.getRol());
            User u = new User();
            u.setRol(rol.getName());
            u.setEmail(user.getEmail());
            u.setUsername(user.getUsername());
            u.setPassword(user.getUsername());

            u = userRepository.saveAndFlush(u);

            return customResponse.getJSONResponse(u);
        }catch(Exception e){
            return customResponse.getBadRequest(e.getMessage());
        }
    }*/

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> findByEmail(String email) {
        User userFound = userRepository.findByEmail(email);
        if (userFound == null)
            return customResponse.getBadRequest("Usuario no encontrado");
        return customResponse.getJSONResponse(userFound);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> updateUser(User user, Long id) {
        var foundUser = userRepository.findById(id);
        if (foundUser.isEmpty()) {
            return customResponse.getBadRequest("Usuario no encontrado");
        }
        Rol rol = Rol.fromString(user.getRol());
        User existingUser = foundUser.get();
        existingUser.setEmail(user.getEmail());
        existingUser.setUsername(user.getUsername());
        existingUser.setRol(rol.getName());
        User updatedUser = userRepository.save(existingUser);
        return customResponse.getJSONResponse(updatedUser);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> updateFcmToken(Long id, String token) {
        var foundUser = userRepository.findById(id);
        if (foundUser.isEmpty()) {
            return customResponse.getBadRequest("Usuario no encontrado");
        }
        User user = foundUser.get();
        user.setFcmToken(token);
        User updatedUser = userRepository.save(user);
        return customResponse.getJSONResponse(updatedUser);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> changeStatus(Long id) {
        var foundUser = userRepository.findById(id);
        if (foundUser.isEmpty()) {
            return customResponse.getBadRequest("Usuario no encontrado");
        }
        User user = foundUser.get();
        user.setStatus(!user.getStatus());
        User updatedUser = userRepository.save(user);

        List<Room> rooms = user.getRoomsAsigned();
        for (Room room : rooms) {
            room.setMaid(null);
        }
        roomRepository.saveAll(rooms);

        return customResponse.getJSONResponse(updatedUser);
    }
}
