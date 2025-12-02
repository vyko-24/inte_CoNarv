package utez.camila.server.security.token;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.camila.server.models.user.User;
import utez.camila.server.models.user.UserService;

@Service
@Transactional
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserService userService;

    public UserDetailsServiceImpl(UserService userService) {
        this.userService = userService;
    }


    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User foundUser = userService.findByEmail(username);
        if (foundUser != null)
            return UserDetailsImpl.build(foundUser);
        throw new UsernameNotFoundException("Usuario no encontrado");
    }
}
