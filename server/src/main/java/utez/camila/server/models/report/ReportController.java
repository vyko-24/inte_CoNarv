package utez.camila.server.models.report;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/report")
@CrossOrigin("*")
public class ReportController {
    @Autowired
    private ReportService reportService;

    @GetMapping("")
    public ResponseEntity<?> getAll() {
        return reportService.getAllReports();
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getByRoom(@PathVariable("roomId") Long roomId) {
        return reportService.getReportsByRoom(roomId);
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addReport(
            @RequestParam ("description") String description,
            @RequestParam ("title") String title,
            @RequestParam ("roomId") Long roomId,
            @RequestPart("imagenes") List<MultipartFile> imagenes

    )
            throws IOException {
        ReportDTO dto = new ReportDTO(title, description, roomId, imagenes);
        return reportService.addReport(dto.toEntity(), imagenes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReport(
            @RequestParam ("description") String description,
            @RequestParam ("title") String title,
            @RequestParam ("roomId") Long roomId,
            @RequestPart("imagenes") List<MultipartFile> imagenes,
            @PathVariable("id") Long id
    ) throws IOException {
        ReportDTO dto = new ReportDTO(title, description, roomId, imagenes);
        return reportService.updateReport(dto.toEntity(), id, imagenes);
    }
}
