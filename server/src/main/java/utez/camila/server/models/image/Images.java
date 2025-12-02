package utez.camila.server.models.image;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import utez.camila.server.models.report.Report;

@Entity
@Table(name = "images")
public class Images {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url", nullable = false)
    private String url;


    @ManyToOne
    @JoinColumn(name = "id_report")
    @JsonIgnoreProperties(value = {"images",})
    private Report report;

    public Images() {
    }

    public Images(String url) {
        this.url = url;
    }

    public Images(String url, Report report) {
        this.url = url;
        this.report = report;
    }

    public Images(Long id, String url, Report report) {
        this.id = id;
        this.url = url;
        this.report = report;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Report getReport() {
        return report;
    }

    public void setReport(Report report) {
        this.report = report;
    }
}
