package utez.camila.server.models.room;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import utez.camila.server.models.user.User;

public class RoomDTO {
    private Long id;
    private String status;
    private String number;
    private User maid;

    public Room toEntity(){
        Room room = new Room();
       // room.setId(id);
        room.setNumber(number);
        room.setStatus(status);
        room.setMaid(maid);
        return room;
    }

    public Long getId() {
        return id;
    }

    public RoomDTO() {
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
}
