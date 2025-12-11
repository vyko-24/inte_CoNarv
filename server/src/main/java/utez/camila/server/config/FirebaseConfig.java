package utez.camila.server.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {

        try {
            // 1) Obtenemos el JSON en BASE64 desde el entorno
            String firebaseBase64 = System.getenv("FIREBASE_JSON_BASE64");

            if (firebaseBase64 == null || firebaseBase64.isBlank()) {
                throw new RuntimeException("FIREBASE_JSON_BASE64 no está configurada");
            }

            // 2) Decodificamos el BASE64
            byte[] decodedBytes = Base64.getDecoder().decode(firebaseBase64);

            // 3) Creamos un InputStream para Firebase
            InputStream serviceAccount = new ByteArrayInputStream(decodedBytes);

            // 4) Configuramos Firebase
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("reactmobile5a.appspot.com")
                    .build();

            // 5) Inicializamos Firebase solo una vez
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase inicializado correctamente desde BASE64.");
            }

        } catch (Exception e) {
            throw new RuntimeException("Error inicializando Firebase: " + e.getMessage(), e);
        }
    }
}