run:
	docker-compose up -d

schema:
	APOLLO_ELV2_LICENSE=accept rover supergraph compose --config ./supergraph-config.yaml > supergraph.graphql