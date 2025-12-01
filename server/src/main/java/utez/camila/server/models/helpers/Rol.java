package utez.camila.server.models.helpers;

public enum Rol {
    ADMIN("ROLE_ADMIN"),
    MAID("ROLE_MAID");

    private final String name;

    public String getName() {
        return name;
    }

    Rol(String name) {
        this.name = name;
    }
    public static Rol fromString(String value) {
        for (Rol r : Rol.values()) {
            if (r.name().equalsIgnoreCase(value) || r.getName().equalsIgnoreCase(value)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}
