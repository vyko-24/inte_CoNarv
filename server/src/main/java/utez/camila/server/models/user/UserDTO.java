package utez.camila.server.models.user;

import jakarta.persistence.Column;

public class UserDTO {
    private Long id;
    private String username;
    private String rol;
    private String email;

    public User toEntity(){
        return new User(id, username, email, rol);
    }
}
