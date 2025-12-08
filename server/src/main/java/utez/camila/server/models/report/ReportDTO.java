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
    private Long roomId;

    public Report toEntity() {
        // Necesitamos asegurar que la Room se asocie correctamente.
        // Como aquí solo tienes el ID (roomId) y no el objeto Room completo,
        // tienes dos opciones:
        // 1. Buscar la Room en el Controller/Service y pasársela al DTO.
        // 2. Crear una Room con solo el ID (Hibernate a veces acepta esto como referencia).

        Room roomRef = new Room();
        roomRef.setId(this.roomId);

        return new Report(title, description, null, roomRef);
        // Nota: Pasamos 'null' en imágenes porque se procesan y agregan después en tu service addReport
    }

    public ReportDTO(String title, String description, Long roomId, List<MultipartFile> imagenes) {
        this.title = title;             // <--- FALTABA ESTO
        this.description = description; // <--- FALTABA ESTO (Culpable del error)
        this.roomId = roomId;
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

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
}
