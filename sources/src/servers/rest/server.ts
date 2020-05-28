import {
    inject,
    lifeCycleObserver,
    CoreBindings,
    Application,
} from "@loopback/core";

/** REST binding imports */
import { RestServer, RestComponent } from "@loopback/rest";

/** Swagger binding imports */
import { RestExplorerComponent } from "@loopback/rest-explorer";

/** Authentication binding imports */
import {
    AuthenticationComponent,
    registerAuthenticationStrategy,
} from "@loopback/authentication";

/** Authorization binding imports */
import {
    AuthorizationOptions,
    AuthorizationDecision,
    AuthorizationBindings,
    AuthorizationComponent,
} from "@loopback/authorization";

import { CRUDBindings } from "../../keys";
import { CRUDRestServerConfig } from "../../types";
import { CRUDTokenStrategy } from "../../providers";
import { Sequence } from "../../servers";

@lifeCycleObserver("servers.REST")
export class CRUDRestServer extends RestServer {
    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        app: Application,
        @inject(CRUDBindings.REST_SERVER_CONFIG)
        config: CRUDRestServerConfig = {}
    ) {
        super(app, config);

        /** Fix rest application to rest server bug */
        (this as any).restServer = this;

        /** Set up default home page */
        if (config.homePath) {
            this.static("/", config.homePath);
        }

        /** Bind rest component */
        app.component(RestComponent);

        /** Bind swagger component */
        app.bind("RestExplorerComponent.KEY").to(
            new RestExplorerComponent(this as any, {
                path: "/explorer",
            })
        );

        /** Bind authentication component */
        registerAuthenticationStrategy(app, CRUDTokenStrategy);
        app.component(AuthenticationComponent);

        /** Bind authorization component */
        app.configure<AuthorizationOptions>(AuthorizationBindings.COMPONENT).to(
            {
                precedence: AuthorizationDecision.DENY,
                defaultDecision: AuthorizationDecision.DENY,
            }
        );
        app.component(AuthorizationComponent);

        /** Set up the custom sequence */
        this.sequence(Sequence);
    }

    async start() {
        await super.start();

        console.log(`REST Server is running on url ${this.url}`);
    }
    async stop() {
        await super.stop();

        console.log(`REST Server is stopped!`);
    }
}
