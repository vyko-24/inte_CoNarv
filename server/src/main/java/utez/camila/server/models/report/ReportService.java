package utez.camila.server.models.report;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import utez.camila.server.config.CustomResponse;
import utez.camila.server.models.helpers.Status;
import utez.camila.server.models.image.FirebaseImageService;
import utez.camila.server.models.image.Images;
import utez.camila.server.models.image.ImagesRepository;
import utez.camila.server.models.room.Room;
import utez.camila.server.models.room.RoomRepository;
import utez.camila.server.models.user.User;
import utez.camila.server.models.user.UserRepository;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {
    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private CustomResponse customResponse;

    @Autowired
    private ImagesRepository imagesRepository;

    @Autowired
    private FirebaseImageService firebaseImageService;
    @Autowired
    private UserRepository userRepository;

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> getAllReports() {
        return customResponse.getJSONResponse(reportRepository.findAllByOrderByIdDesc());
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> getReportsByRoom(Long roomId) {
        Optional<Room> roomFound = roomRepository.findById(roomId);
        if (roomFound.isPresent()) {
            return customResponse.getJSONResponse(reportRepository.findAllByRoomsAsigned(roomFound.get()));
        } else {
            return customResponse.getBadRequest("Room not found");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> addReport(Report report, List<MultipartFile> imagenes) throws IOException {
        Report newReport = reportRepository.save(report);

        Optional<Room> roomFound = roomRepository.findById(report.getRoomsAsigned().getId());
        if (roomFound.isPresent()) {
            Room room = roomFound.get();
            Status statusEnum = Status.fromString("BLOCKED");
            room.setStatus(statusEnum.getName());
            roomRepository.save(room);
        }

        for (MultipartFile file : imagenes) {
            String url = firebaseImageService.uploadImage(file);

            Images img = new Images();
            img.setUrl(url);
            img.setReport(newReport);

            imagesRepository.save(img);
        }
        List<User> admins= userRepository.findByRol("ROLE_ADMIN");
        for(User admin: admins){
            if (admin.getFcmToken() != null){

                String title = "¡Oh no, algo ocurrió en un cuarto!";
                String body = "El cuarto "+ roomFound.get().getNumber() + " tiene un nuevo reporte: " + newReport.getTitle();

                sendPushNotification(
                        admin.getFcmToken(),
                        title,
                        body
                );
            }
        }

        return customResponse.getJSONResponse(newReport);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> updateReport(Report report, Long id, List<MultipartFile> imagenes
    ) throws IOException {
        Optional<Report> reportFound = reportRepository.findById(id);
        if (!reportFound.isPresent()) {
            return customResponse.getBadRequest("Reporte no encontrado");
        }
        Report existingReport = reportFound.get();
        existingReport.setTitle(report.getTitle());
        existingReport.setDescription(report.getDescription());

        List<Images> oldImages = existingReport.getImagenes();

        for (Images img : oldImages) {
            imagesRepository.delete(img);
        }

        existingReport.getImagenes().clear();

        if (imagenes != null && !imagenes.isEmpty()) {

            for (MultipartFile file : imagenes) {

                String url = firebaseImageService.uploadImage(file);

                Images newImg = new Images();
                newImg.setUrl(url);
                newImg.setReport(existingReport);

                imagesRepository.save(newImg);

                existingReport.getImagenes().add(newImg);
            }
        }

        reportRepository.saveAndFlush(existingReport);
        return customResponse.getJSONResponse(existingReport);
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
