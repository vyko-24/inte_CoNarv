package utez.camila.server.models.report;

import org.springframework.web.multipart.MultipartFile;
import utez.camila.server.models.image.Images;
import utez.camila.server.models.room.Room;

import java.util.List;

public class ReportDTO {
    private Long id;
    private String title;
    private String description;
    private List<Images> imagenes;
    private Room roomsAsigned;

    public Report toEntity(){
        return new Report(title, description, imagenes, roomsAsigned);
    }

    public ReportDTO(String title, String description, Long roomId, List<MultipartFile> imagenes) {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Images> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<Images> imagenes) {
        this.imagenes = imagenes;
    }

    public Room getRoomsAsigned() {
        return roomsAsigned;
    }

    public void setRoomsAsigned(Room roomsAsigned) {
        this.roomsAsigned = roomsAsigned;
    }
}
