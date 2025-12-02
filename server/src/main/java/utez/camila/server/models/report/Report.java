package utez.camila.server.models.report;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import utez.camila.server.models.image.Images;
import utez.camila.server.models.room.Room;
import utez.camila.server.models.user.User;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "report")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name="description", nullable = false, length = 500)
    private String description;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = {"report"})
    private List<Images> imagenes = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "id_room")  // AQUÍ SÍ va la FK
    @JsonIgnoreProperties(value = {"report", "maid"})
    private Room roomsAsigned;

    public Report() {
    }

    public Report(String title, String description, List<Images> imagenes, Room roomsAsigned) {
        this.title = title;
        this.description = description;
        this.imagenes = imagenes;
        this.roomsAsigned = roomsAsigned;
    }

    public Report(Long id, String title, String description, List<Images> imagenes, Room roomsAsigned) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imagenes = imagenes;
        this.roomsAsigned = roomsAsigned;
    }

    public Room getRoomsAsigned() {
        return roomsAsigned;
    }

    public void setRoomsAsigned(Room roomsAsigned) {
        this.roomsAsigned = roomsAsigned;
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
}
