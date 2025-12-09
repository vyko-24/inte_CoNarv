package utez.camila.server.models.helpers;

public enum Status {
    CLEAN("STATUS_CLEAN"),
    DIRTY("STATUS_DIRTY"),
    MAINTENANCE("STATUS_MAINTENANCE"),
    BLOCKED("STATUS_BLOCKED");

    private final String name;

    Status(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }


    public static Status fromString(String value) {
        for (Status r : Status.values()) {
            if (r.name().equalsIgnoreCase(value) || r.getName().equalsIgnoreCase(value)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}
