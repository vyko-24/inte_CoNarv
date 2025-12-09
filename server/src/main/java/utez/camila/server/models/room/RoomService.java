package utez.camila.server.models.room;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.camila.server.config.CustomResponse;
import utez.camila.server.models.helpers.Status;
import utez.camila.server.models.report.Report;
import utez.camila.server.models.report.ReportRepository;
import utez.camila.server.models.user.User;
import utez.camila.server.models.user.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    private CustomResponse customResponse;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRepository usersRepository;

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
        Optional<Room> nombreRoomFound = roomRepository.findByNumber(room.getNumber());
        if(nombreRoomFound.isPresent() && !nombreRoomFound.get().getId().equals(id)) {
            return customResponse.getBadRequest("El número de cuarto ya está en uso");
        }
        Room existingRoom = roomFound.get();
        existingRoom.setNumber(room.getNumber());

        Optional<User> userFound = usersRepository.findById(room.getMaid().getId());
        if(!userFound.isPresent()) {
            return customResponse.getBadRequest("Mucama no encontrada");
        }
        if(userFound.get().getRol().equals("ROLE_ADMIN")) {
            return customResponse.getBadRequest("No se puede asignar un administrador como mucama");
        }
        // validación si hay maid y si esa maid no es la misma que la anterior
        if(existingRoom.getMaid() != null && !existingRoom.getMaid().getId().equals(room.getMaid().getId())) {
            User existingUser = userFound.get();
            existingRoom.setMaid(room.getMaid());

            if(existingUser.getFcmToken() != null) {
                String title = "Nuevo cuarto asignado";
                String body = "Se te ha asignado el cuarto número " + existingRoom.getNumber();
                sendPushNotification(existingUser.getFcmToken(), title, body);
            }
        }

        Status status = Status.fromString(room.getStatus());
        existingRoom.setStatus(status.getName());
        roomRepository.saveAndFlush(existingRoom);
        return customResponse.getJSONResponse(existingRoom);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> deleteRoom(Long id) {
        Optional<Room> roomFound = roomRepository.findById(id);
        if(!roomFound.isPresent()) {
            return customResponse.getBadRequest("Cuarto no encontrado");
        }
        roomRepository.deleteById(id);
        return customResponse.getJSONResponse("Cuarto eliminado correctamente");
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> changeAllCleanTime(LocalDateTime cleanedAt) {
        var rooms = roomRepository.findAll();
        for (Room room : rooms) {
            room.setCleanTime(cleanedAt);
        }
        return customResponse.getJSONResponse("Fechas de limpieza actualizadas correctamente");
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> findRoomsByMaid(Long maidId) {
        Optional<User> userFound = userRepository.findById(maidId);
        if(!userFound.isPresent()) {
            return customResponse.getBadRequest("Mucama no encontrada");
        }
        var rooms = roomRepository.findByMaid(userFound.get());
        return customResponse.getJSONResponse(rooms);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> changeStatus(Long id, String status) {
        Optional<Room> roomFound = roomRepository.findById(id);
        if(!roomFound.isPresent()) {
            return customResponse.getBadRequest("Cuarto no encontrado");
        }
        Room room = roomFound.get();
        Status statusEnum = Status.fromString(status);
        room.setStatus(statusEnum.getName());
        roomRepository.saveAndFlush(room);
        return customResponse.getJSONResponse(room);
    }


    public void sendPushNotification(String token, String title, String body) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(notification)
                    .build();

            FirebaseMessaging.getInstance().send(message);

            System.out.println("Notificación enviada!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


}
