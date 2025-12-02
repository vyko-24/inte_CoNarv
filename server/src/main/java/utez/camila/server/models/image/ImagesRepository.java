package utez.camila.server.models.image;


import org.springframework.data.jpa.repository.JpaRepository;
import utez.camila.server.models.report.Report;

import java.util.List;


public interface ImagesRepository extends JpaRepository<Images, Long> {
    List<Images> findByReport(Report report);

    Images findByUrl(String url);
}
