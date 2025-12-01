package utez.camila.server.models.room;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.camila.server.config.CustomResponse;
import utez.camila.server.models.helpers.Status;
import utez.camila.server.models.user.User;
import utez.camila.server.models.user.UserRepository;

import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    private CustomResponse customResponse;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> getAllRooms() {
        return customResponse.getJSONResponse(roomRepository.findAll());
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> getRoomById(Long id) {
        if (!roomRepository.existsById(id)) {
            return customResponse.getBadRequest("Cuarto no encontrado");
        }
        return customResponse.getJSONResponse(roomRepository.findById(id).get());
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> createRoom(Room room) {
        Optional<User> userFound = userRepository.findById(room.getMaid().getId());
        if(!userFound.isPresent()) {
            return customResponse.getBadRequest("Mucama no encontrada");
        }
        room.setMaid(userFound.get());
        roomRepository.saveAndFlush(room);
        return customResponse.getJSONResponse(room);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> updateRoom(Room room, Long id) {
        Optional<Room> roomFound = roomRepository.findById(id);
        if(!roomFound.isPresent()) {
            return customResponse.getBadRequest("Cuarto no encontrado");
        }
        Room existingRoom = roomFound.get();
        existingRoom.setNumber(room.getNumber());
        existingRoom.setMaid(room.getMaid());
        Status status = Status.fromString(room.getStatus());
        existingRoom.setStatus(status.getName());
        roomRepository.saveAndFlush(existingRoom);
        return customResponse.getJSONResponse(existingRoom);
    }
}
