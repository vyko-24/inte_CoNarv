package utez.camila.server.models.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.camila.server.config.CustomResponse;
import utez.camila.server.models.helpers.Rol;
import utez.camila.server.models.room.Room;
import utez.camila.server.models.room.RoomRepository;
import utez.camila.server.security.PasswordConfig;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    private final CustomResponse customResponse;

    private final RoomRepository roomRepository;
    private final PasswordConfig passwordConfig;

    public UserService(UserRepository userRepository, CustomResponse customResponse, RoomRepository roomRepository, PasswordEncoder passwordEncoder, PasswordConfig passwordConfig) {
        this.userRepository = userRepository;
        this.customResponse = customResponse;
        this.roomRepository = roomRepository;
        this.passwordConfig = passwordConfig;
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> findAllUsers() {
        return customResponse.getJSONResponse(userRepository.findAll());
    }


    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> createUser(UserDTO userDto) {
        try {
            // Validar si el correo ya existe
            if (userRepository.findByEmail(userDto.getEmail()) != null) {
                return customResponse.getBadRequest("El correo electrónico ya está registrado.");
            }

            // Convertir DTO a Entidad
            User user = userDto.toEntity();

            // Configuraciones por defecto
            user.setStatus(true); // Usuario activo por defecto

            // Validar y setear el Rol correctamente
            Rol rol = Rol.fromString(userDto.getRol());
            user.setRol(rol.getName());

            // Encriptar contraseña (Por defecto usamos el username como password inicial)
            user.setPassword(passwordConfig.passwordEncoder().encode(user.getUsername()));

            // Guardar
            User savedUser = userRepository.saveAndFlush(user);

            return customResponse.getJSONResponse(savedUser);
        } catch (IllegalArgumentException e) {
            return customResponse.getBadRequest("Rol inválido: " + userDto.getRol());
        } catch (Exception e) {
            e.printStackTrace();
            return customResponse.getBadRequest("Error al crear el usuario: " + e.getMessage());
        }
    }
    @Transactional(rollbackFor = Exception.class)
    public User findByEmail(String email){
        User userFound = userRepository.findByEmail(email);
        if (userFound == null)
            return null;
        return userFound;
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
