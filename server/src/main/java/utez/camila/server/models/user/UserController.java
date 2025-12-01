package utez.camila.server.models.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("")
    public ResponseEntity<?> findAll() {
        return userService.findAllUsers();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestBody UserDTO user, @PathVariable("id") Long id) {
        return userService.updateUser(user.toEntity(), id);
    }

    @PatchMapping("/status/{id}")
    public ResponseEntity<?> changeStatus(@PathVariable("id") Long id) {
        return userService.changeStatus(id);
    }
}
