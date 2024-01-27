import { Apollo, APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

const uri = 'http://localhost:8080/graphql';

export function createApollo(httpLink: HttpLink) {

  const auth = setContext((operation, context) => {
    const token = localStorage.getItem('accessToken');

    if (token === null) {
      console.log("JWT NOT FOUND")
      return {};

    } else {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
  });

  const link = ApolloLink.from([auth, httpLink.create({ uri })]);
  const cache = new InMemoryCache();

  return {
    link,
    cache,
  };
}

@NgModule({
  exports: [HttpClientModule, ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
