package com.tikal.api.model.dto.temple;

import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.dto.sync.domain.GamificationEventDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TempleUpdateResponse {
    private WorkspaceSyncDTO.TempleSyncDTO templeMode;
    private List<GamificationEventDTO> gamificationEvents;
}
