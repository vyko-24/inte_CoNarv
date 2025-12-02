package utez.camila.server.models.room;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.camila.server.models.user.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByMaid(User user);

    Optional<Room> findByNumber(String number);
}
