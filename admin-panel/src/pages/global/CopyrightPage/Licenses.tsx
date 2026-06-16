import classes from "./CopyrightPage.module.css";

export const CC_BY_NC_ND_4_0 = (
    <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">
        CC BY-NC-ND 4.0
        <img
            src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
            alt="Creative Commons symbol"
            className={classes.licenseIcon}
        />
        <img
            src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
            alt="Attribution (BY) symbol"
            className={classes.licenseIcon}
        />
        <img
            src="https://mirrors.creativecommons.org/presskit/icons/nc.svg"
            alt="Non-Commercial (NC) symbol"
            className={classes.licenseIcon}
        />
        <img
            src="https://mirrors.creativecommons.org/presskit/icons/nd.svg"
            alt="No Derivatives (ND) symbol"
            className={classes.licenseIcon}
        />
    </a>
);
