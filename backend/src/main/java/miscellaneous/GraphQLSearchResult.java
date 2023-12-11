package miscellaneous;

import entity.Listing;

import java.util.List;

public class GraphQLSearchResult {
    public List<Listing> listings;
    public long totalHitCount;

    public void setListings(List<Listing> listings) {
        this.listings = listings;
    }

    public void setTotalHitCount(long totalHitCount) {
        this.totalHitCount = totalHitCount;
    }

    @Override
    public String toString() {
        return "GraphQLSearchResult{" +
                "listings=" + listings +
                ", totalHitCount=" + totalHitCount +
                '}';
    }
}