package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RankingMemberWidgetData {
    private List<UserRankData> members;

    @Data
    @Builder
    public static class UserRankData {
        private Integer id;
        private String name;
        private String rol;
        private String avatar;
        private Integer score;
    }
}
