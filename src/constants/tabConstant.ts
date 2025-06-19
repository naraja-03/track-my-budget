import { Route } from "./routeConstant";

const ListingSearchTab = {
    name: "Listing Search",
    tabId: 1,
    routeLink: Route.HOME
}
const DirectoryListingTab = {
    name: "Directory Listing",
    tabId: 2,
    routeLink: Route.DIRECTORY_LISTING
};
const ComplexListingTab = {
    name: "Complex Listing",
    tabId: 3,
    routeLink: Route.COMPLEX_LISTING
};


const TabLists = [ListingSearchTab, DirectoryListingTab, ComplexListingTab]

export { TabLists }