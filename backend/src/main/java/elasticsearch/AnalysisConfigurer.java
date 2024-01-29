package elasticsearch;


import io.quarkus.hibernate.search.orm.elasticsearch.SearchExtension;
import org.hibernate.search.backend.elasticsearch.analysis.ElasticsearchAnalysisConfigurationContext;
import org.hibernate.search.backend.elasticsearch.analysis.ElasticsearchAnalysisConfigurer;

@SearchExtension
public class AnalysisConfigurer implements ElasticsearchAnalysisConfigurer {

    @Override
    public void configure(ElasticsearchAnalysisConfigurationContext context) {
        context.analyzer("english").custom()
                .tokenizer("standard")
                .tokenFilters("asciifolding", "lowercase", "porter_stem", "edge_ngram_filter", "stop");
        // Define the edge_ngram_filter
        context.tokenFilter("edge_ngram_filter")
                .type("edge_ngram")
                .param("min_gram", "3")
                .param("max_gram", "10");

        context.tokenFilter("stop")
                .type("stop")
                .param("ignore_case", true)
                .param("stopwords", "_english_");
    }
}