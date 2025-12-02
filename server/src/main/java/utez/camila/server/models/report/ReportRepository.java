package utez.camila.server.models.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utez.camila.server.models.room.Room;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByIdDesc();
    Optional<Report> findByTitle(String title);
    List<Report> findAllByRoomsAsigned(Room roomsAsigned);
}
