package miscellaneous;

import entity.Listing;
import org.eclipse.microprofile.graphql.Description;

import java.util.List;

@Description("Represents a search result for listings.")
public class GraphQLSearchResult {
    @Description("The listings returned by the search, possibly limited by the pagination parameters.")
    public List<Listing> listings;

    @Description("The total number of listings matching the search.")
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