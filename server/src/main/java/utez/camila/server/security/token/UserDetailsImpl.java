package utez.camila.server.security.token;


import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import utez.camila.server.models.user.User;

import java.util.Collection;
import java.util.Set;

public class UserDetailsImpl implements UserDetails {
    private String email;
    private String password;
    private boolean enabled;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(String username, String password, boolean enabled, Collection<? extends GrantedAuthority> authorities) {
        this.email = username;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    public static UserDetails build (User user) {
        return new UserDetailsImpl(
                user.getEmail(), user.getPassword(),
                user.getStatus(),
                Set.of(new SimpleGrantedAuthority(user.getRol())) // Asignar un permiso genérico
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

}
