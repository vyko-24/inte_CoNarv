package utez.camila.server.models.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.camila.server.config.CustomResponse;
import utez.camila.server.models.user.User;
import utez.camila.server.models.user.UserRepository;
import utez.camila.server.security.token.JwtProvider;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository useRepository;

    @Autowired
    private CustomResponse customResponse;

    private final AuthenticationManager manager;
    private final JwtProvider provider;
    private final PasswordEncoder encoder;

    public AuthService(AuthenticationManager manager, JwtProvider provider, PasswordEncoder encoder) {
        this.manager = manager;
        this.provider = provider;
        this.encoder = encoder;
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> login(LoginDto dto) {
        System.out.println("DTO contraseña llega como: " + dto.getPassword());

        System.out.println("banana1");
        System.out.println(dto);

        try {
            User foundUser = useRepository.findByEmail(dto.getEmail());
            if (foundUser == null)
                return customResponse.get400Response(404);

            // Validar si está activo
            if (!foundUser.getStatus())
                return customResponse.getBadRequest("Usuario inactivo");
            Authentication auth = manager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            dto.getEmail(),
                            dto.getPassword()
                    )
            );

            // Guardar autenticación
            SecurityContextHolder.getContext().setAuthentication(auth);

            // Generar el token
            String token = provider.generateToken(auth);


            // Crear DTO firmado
            SignedDto signedDto = new SignedDto(token, "Bearer", foundUser);

            return customResponse.getLoginJSONResponse(signedDto);

        } catch (Exception e) {
            e.printStackTrace();
            return customResponse.get400Response(400);
        }
    }


    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> register(User user){
        if (useRepository.findByEmail(user.getEmail()) != null)
            return customResponse.getBadRequest("Correo ya registrado");
        user.setPassword(encoder.encode(user.getPassword()));
        user.setStatus(true);
        return customResponse.getJSONResponse(useRepository.save(user));
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> updatePassword(Long id, LoginDto coso){
        Optional<User> foundUser = useRepository.findById(id);
        if (!foundUser.isPresent())
            return customResponse.get400Response(404);
        User user = foundUser.get();
        user.setPassword(encoder.encode(coso.getPassword()));
        return customResponse.getJSONResponse(useRepository.saveAndFlush(user));
    }


    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> save(User user){
        if (useRepository.findByEmail(user.getEmail()) != null)
            return customResponse.getBadRequest("Correo ya registrado");
        // contraseña es el correo sin lo que hay en adelante de la arroba
        user.setPassword(encoder.encode(user.getEmail().split("@")[0]));
        user.setStatus(true);
        return customResponse.getJSONResponse(useRepository.save(user));
    }

}
