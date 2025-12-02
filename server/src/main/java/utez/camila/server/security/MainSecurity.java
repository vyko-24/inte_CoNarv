package utez.camila.server.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import utez.camila.server.security.filters.AuthFilter;
import utez.camila.server.security.interceptors.CustomInterceptorVBO;
import utez.camila.server.security.token.JwtAuthentication;
import utez.camila.server.security.token.UserDetailsServiceImpl;

//BA03: Crear objeto de configuracion de seguridad para proteger rutas
@Configuration
@EnableWebSecurity
public class MainSecurity implements WebMvcConfigurer {

    @Autowired
    private AuthFilter authFilter;

    private final UserDetailsServiceImpl service;

    public MainSecurity(UserDetailsServiceImpl service) {
        this.service = service;
    }

    // Genera el encoder de contraseñas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(service);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }


    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthentication filter(){
        return new JwtAuthentication();
    }

    @Autowired
    private CustomInterceptorVBO customInterceptor;

    private final static String[] WHITE_LIST ={
            "/api/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/swagger-ui/**"
    };

    private final static String[] ADMIN_LIST ={
            "/api/user/**",
            "/api/room/**",
            "/api/report/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req ->
                        req.requestMatchers(WHITE_LIST).permitAll()
                                .requestMatchers(ADMIN_LIST).authenticated()
                                .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .headers(h -> h.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(filter(), UsernamePasswordAuthenticationFilter.class)
                .logout(out -> out.logoutUrl("/api/auth/logout").clearAuthentication(true));

        return http.build();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(customInterceptor)
                .addPathPatterns("/api/test/secured");
    }
}

// Siguiente -> crear nuestro filtro personalizado
