package utez.camila.server.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() throws IOException {
        try (InputStream serviceAccount =
                     getClass().getClassLoader().getResourceAsStream("firebase/serviceAccountKey.json")) {

            if (serviceAccount == null) {
                throw new RuntimeException("No se encontró serviceAccountKey.json");
            }


            // --- Se construyen las opciones de Firebase ---
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("reactmobile5a.appspot.com")   // <-- IMPORTANTE
                    .build();

            // --- Solo inicializa Firebase si no existe ---
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase inicializado correctamente.");
            }
        }
    }
}

