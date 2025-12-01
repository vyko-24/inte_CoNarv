package utez.camila.server.models.room;

import org.springframework.data.jpa.repository.JpaRepository;
import utez.camila.server.models.user.User;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUser(User user);
}
