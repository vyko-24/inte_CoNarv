package utez.camila.server.config;

import com.google.firebase.database.core.Repo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import utez.camila.server.models.image.Images;
import utez.camila.server.models.image.ImagesRepository;
import utez.camila.server.models.report.Report;
import utez.camila.server.models.report.ReportRepository;
import utez.camila.server.models.room.Room;
import utez.camila.server.models.room.RoomRepository;
import utez.camila.server.models.user.User;
import utez.camila.server.models.user.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Configuration
public class InitialConfig implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImagesRepository imagesRepository;

    public InitialConfig(UserRepository userRepository, ReportRepository reportRepository, RoomRepository roomRepository, PasswordEncoder passwordEncoder, ImagesRepository imagesRepository) {
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.roomRepository = roomRepository;
        this.passwordEncoder = passwordEncoder;
        this.imagesRepository = imagesRepository;
    }

    @Transactional
    public User getOrSaveUser(User user) {
        User foundUser = userRepository.findByEmail(user.getEmail());
        if (foundUser != null) {
            return foundUser;
        } else {
            return userRepository.save(user);
        }
    }

    @Transactional
    public Images getOrSaveImage(Images image) {
        Images foundImage = imagesRepository.findByUrl(image.getUrl());
        if (foundImage != null) {
            return foundImage;
        } else {
           return imagesRepository.save(image);
        }
    }

    @Transactional
    public Room getOrSaveRoom(Room room) {
        Optional<Room> foundRoom = roomRepository.findByNumber(room.getNumber());
        if (foundRoom.isPresent()) {
            return foundRoom.get();
        } else {
            return roomRepository.save(room);
        }
    }

    @Transactional
    public Report getOrSaveReport(Report report) {
        Optional<Report> foundReport = reportRepository.findByTitle(report.getTitle());
        if (foundReport.isPresent()) {
            return foundReport.get();
        } else {
            return reportRepository.save(report);
        }
    }

    @Override
    public void run(String... args) throws Exception {
        User admin = getOrSaveUser(new User("Víctor", passwordEncoder.encode("password123"), "cafatofo@gmail.com", "ROLE_ADMIN", true));
        User admin2 = getOrSaveUser(new User("Cristian", passwordEncoder.encode("password123"), "cris@gmail.com", "ROLE_ADMIN", true));
        User admin3 = getOrSaveUser(new User("Vale", passwordEncoder.encode("password123"), "vale@gmail.com", "ROLE_ADMIN", true));
        User maid1 = getOrSaveUser(new User("Agles", passwordEncoder.encode("password123"), "agles@gmail.com", "ROLE_MAID", true));
        User maid2 = getOrSaveUser(new User("Eddie", passwordEncoder.encode("password123"), "eddie@gmail.com", "ROLE_MAID", true));

        Room roomA01 = getOrSaveRoom(new Room("STATUS_CLEAN", "A-01", maid1, LocalDateTime.now()));
        Room roomA02 = getOrSaveRoom(new Room("STATUS_CLEAN", "A-02", maid1, LocalDateTime.now()));
        Room roomA03 = getOrSaveRoom(new Room("STATUS_CLEAN", "A-03", maid2, LocalDateTime.now()));
        Room roomA04 = getOrSaveRoom(new Room("STATUS_BLOCKED", "A-04", maid2, LocalDateTime.now()));

        Images img1 = new Images("https://picsum.photos/id/1/200/300");
        Images img2 = new Images("https://picsum.photos/id/2/200/300");
        Images img3 = new Images("https://picsum.photos/id/3/200/300");
        Images img4 = new Images("https://picsum.photos/id/4/200/300");

        Report report1 = getOrSaveReport(new Report("Algo mamo", "Pos algo mamo en el cuarto mijo", List.of(img1, img2), roomA04));

    }
}
