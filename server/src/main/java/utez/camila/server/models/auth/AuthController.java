package utez.camila.server.models.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utez.camila.server.models.user.UserDTO;
import utez.camila.server.models.user.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private UserService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto dto){
       return authService.login(dto);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO usuario){
        return authService.save(usuario.toEntity());
    }

    @PostMapping("/update-fcm-token")
    public ResponseEntity<?> updateFcmToken(
            @RequestParam Long userId,
            @RequestParam String token
    ) {
        return usuarioService.updateFcmToken(userId, token);
    }

}
