package utez.camila.server.models.room;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import utez.camila.server.models.user.User;

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
    @JoinColumn(name = "id_user")
    @JsonIgnoreProperties(value = {"roomsAsigned","password"})
    private User maid;

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
