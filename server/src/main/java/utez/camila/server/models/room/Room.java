package utez.camila.server.models.room;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import utez.camila.server.models.report.Report;
import utez.camila.server.models.user.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="status", nullable = false)
    private String status;

    @Column(name="number", nullable = false)
    private String number;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = true)
    @JsonIgnoreProperties(value = {"roomsAsigned","password"})
    private User maid;

    @Column(name="cleaned_time")
    private LocalDateTime cleanTime;

    @OneToMany(mappedBy = "roomsAsigned", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = {"roomsAsigned"})
    private List<Report> report = new ArrayList<>();

    public LocalDateTime getCleanTime() {
        return cleanTime;
    }

    public Room(String status, String number, User maid, LocalDateTime cleanTime) {
        this.status = status;
        this.number = number;
        this.maid = maid;
        this.cleanTime = cleanTime;
    }

    public List<Report> getReport() {
        return report;
    }

    public void setReport(List<Report> report) {
        this.report = report;
    }

    public void setCleanTime(LocalDateTime cleanTime) {
        this.cleanTime = cleanTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public User getMaid() {
        return maid;
    }

    public void setMaid(User maid) {
        this.maid = maid;
    }

    public Room() {
    }

    public Room(String status, String number, User maid) {
        this.status = status;
        this.number = number;
        this.maid = maid;
    }

    public Room(Long id, String status, String number, User maid) {
        this.id = id;
        this.status = status;
        this.number = number;
        this.maid = maid;
    }
}
