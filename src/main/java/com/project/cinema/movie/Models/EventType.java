package com.project.cinema.movie.Models;

public enum EventType {
    HOLIDAY("Lễ hội"),
    SEASONAL("Theo mùa"),
    SPECIAL("Đặc biệt"),
    PROMOTION("Khuyến mãi"),
    NEW_YEAR("Tết"),
    VALENTINE("Valentine"),
    WOMEN_DAY("Ngày Quốc tế Phụ nữ"),
    CHILDREN_DAY("Ngày Quốc tế Thiếu nhi"),
    INDEPENDENCE_DAY("Ngày Quốc khánh"),
    CHRISTMAS("Giáng sinh");
    
    private final String displayName;
    
    EventType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
