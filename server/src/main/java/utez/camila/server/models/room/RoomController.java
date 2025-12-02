package utez.camila.server.models.room;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@CrossOrigin("*")
@RequestMapping(("api/room"))
public class RoomController {
    @Autowired
    private RoomService roomService;

    @GetMapping("")
    public ResponseEntity<?> getAll() {
        return roomService.getAllRooms();
    }

    @GetMapping("/maid/{id}")
    public ResponseEntity<?> getByMaid(@PathVariable("id") Long id) {
        return roomService.findRoomsByMaid(id);
    }

    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody RoomDTO roomDTO) {
        return roomService.createRoom(roomDTO.toEntity());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestBody RoomDTO roomDTO, @PathVariable("id") Long id) {
        return roomService.updateRoom(roomDTO.toEntity(), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        return roomService.deleteRoom(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") Long id) {
        return roomService.getRoomById(id);
    }

    @PatchMapping("/cleanTime")
    public ResponseEntity<?> updateCleanTime(LocalDateTime cleanTime) {
        return roomService.changeAllCleanTime(cleanTime);
    }

    @PatchMapping("/status/{id}/{status}")
    public ResponseEntity<?> changeStatus(@PathVariable("id") Long id, @PathVariable("status") String status) {
        return roomService.changeStatus(id, status);
    }
}
