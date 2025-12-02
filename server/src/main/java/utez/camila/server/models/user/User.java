package utez.camila.server.models.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import utez.camila.server.models.room.Room;

import java.util.List;

@Table(name = "user")
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name="username", nullable = false)
    private String username;

    @Column(name="password", nullable = false)
    private String password;

    @Column(name="email", nullable = false)
    private String email;

    @Column(name="rol", nullable = false)
    private String rol;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @OneToMany(mappedBy = "maid")
    @JsonIgnore
    private List<Room> roomsAsigned;

    public List<Room> getRoomsAsigned() {
        return roomsAsigned;
    }

    public void setRoomsAsigned(List<Room> roomsAsigned) {
        this.roomsAsigned = roomsAsigned;
    }

    public User(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public User(Long id, String username, String email, String rol) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.rol = rol;
    }

    public User(String username, String password, String email, String rol, Boolean status) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.rol = rol;
        this.status = status;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getFcmToken() {
        return fcmToken;
    }

    public void setFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    @Column(length = 500)
    private String fcmToken;

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public User(String username, String password, String email, String rol) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.rol = rol;
    }

    public User(Long id, String username, String password, String email, String rol) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.rol = rol;
    }
}
