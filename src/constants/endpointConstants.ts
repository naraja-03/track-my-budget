const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const amsUrl = process.env.NEXT_PUBLIC_API_AMS_URL;
const sqeUrl = process.env.NEXT_PUBLIC_API_SQE_URL;
const ripRebuild = process.env.NEXT_PUBLIC_API_RIP_REBUILD_URL;
const accountSearch = process.env.NEXT_PUBLIC_ACCOUNT_URL;
const radiusUrl = process.env.NEXT_PUBLIC_GET_IP_URL;
const isProd = process.env.NEXT_PUBLIC_ENV == "prod";
const profileURL = process.env.NEXT_PUBLIC_PROFILE_URL;
const ontBaseUrl = process.env.NEXT_PUBLIC_ONT_URL;

const getWireCenter = isProd
  ? `${baseUrl}/inventory/v1/allWirecenters`
  : `${baseUrl}/boss/inventory/v1/allWirecenters`;

const getCustomer = isProd
  ? `${baseUrl}/inventory/v1/inventory`
  : `${baseUrl}/boss/inventory/v1/inventory`;

const basicAuth = isProd
  ? `${baseUrl}/boss/oauth?grant_type=client_credentials`
  : `${baseUrl}/oauth/client_credential/accesstoken?grant_type=client_credentials`;

const templateCreation = isProd
  ? `${baseUrl}/inventory/template/`
  : `${baseUrl}/boss/inventory/template/`;

const ripandRebuild = isProd
  ? `${ripRebuild}/oauth?grant_type=client_credentials`
  : `${ripRebuild}/oauth/client_credential/accesstoken?grant_type=client_credentials`;

const configureEquipment = isProd
  ? `${baseUrl}/inventory/template/createEquipment`
  : `${baseUrl}/boss/inventory/template/createEquipment`;

export const ENDPOINTS_CONSTANTS = {
  USERS: "/api/users",

  GET_ACCOUNT_AUTH_TOKEN: `${accountSearch}/oauth/client_credential/accesstoken?grant_type=client_credentials`,
  GET_RADIUS_AUTH_TOKEN: `${radiusUrl}/oauth/client_credential/accesstoken?grant_type=client_credentials`,
  GET_AUTH_TOKEN: basicAuth,
  GET_AMS_AUTH_TOKEN: `${amsUrl}/oauth/client_credential/accesstoken?grant_type=client_credentials`,
  GET_RIP_REBUILD_AUTH_TOKEN: ripandRebuild,
  GET_PROFILE: `${profileURL}/oauth/client_credential/accesstoken?grant_type=client_credentials`,
  SERVER: {
    GET_SQE_TOKEN: `${sqeUrl}/oauth?grant_type=client_credentials`,
    GET_WIRE_CENTER: getWireCenter,
    GET_INVENTORY: `${baseUrl}/inventory/v1/wirecenter`,
    GET_INVENTORY_EQU: `${baseUrl}/inventory/v1/getEquipmentDetails`,
    GET_INVENTORY_DETAILS: `${baseUrl}/inventory/createconnection/queryEquipment`,
    GET_DEVICE_DETAILS: `${baseUrl}/inventory/createconnection/queryEquipment`,
    CONFIGURE_EQUIPMENT: configureEquipment,
    CREATE_EQUIPMENT: templateCreation,
    RIP_REBUILD: `${baseUrl}/bulk-case-creation`,
    GET_SQE_CUSTOMER: `${sqeUrl}/v2/sqe-gw/customer`,
    GET_ADDRESS_LIST: `${amsUrl}/ams2-digital/restservices/adq-api/v1/lookup`,
    GET_SERVICE_QUALIFICATION: getCustomer,
    GET_CPE_RULE_LIST: `${baseUrl}/cperule/list`,
    CREATE_CPE_RULE: `${baseUrl}/cperule/create`,
    UPDATE_CPE_RULE: `${baseUrl}/cperule/update`,
    DELETE_CPE_RULE: `${baseUrl}/cperule/delete`,
    GET_CPE_RULE_META: `${baseUrl}/cperule/meta`,
    GET_SUBSCRIBER: `${radiusUrl}/radius/simple/realms/brightspeed.com/subscribers`,
    CREATE_NODE_DROPTERMINAL: `${baseUrl}/boss/inventory/v1/graph/create_nodes`,
  },
  CLIENT: {
    GET_SQE_TOKEN: "/api/getSqeToken",
    GET_ASM_TOKEN: "/api/amsSQEandLR",
    GET_WIRE_CENTER: `/api/Wirecenters`,
    GET_INVENTORY: `/api/InventorySearch/`,
    GET_OLT_PORTS: `${baseUrl}/inventory/v1/olt`,
    GET_ADDRESS_DETAILS: `${baseUrl}/inventory/v1/getAddressDetails`,
    GET_CUSTOMER_DETAILS: `${baseUrl}/inventory/v1/getCustomerDetails`,
    GET_DEVICE_DETAILS: `/api/queryEquipment`,
    GET_TREE_VIEW_DATA: `${baseUrl}/inventory/v1/equipment/getTreeData`,
    INVENTORY: `${baseUrl}/inventory/v1/getEquipmentTemplateDetail`,
    GET_DROP_TERMINAL: `${baseUrl}/inventory/v1/dropterminal`,
    GET_ADDRESS_LIST: `api/getAddress`,
    GET_FULL_ADDRESS_LIST: `${baseUrl}/ams/v1/buyflow/restservices/adq-api/v1/getQualificationAddress`,
    GET_SQE_CUSTOMER: `api/sqeCustomer`,
    GET_TEMPLATE: `${baseUrl}/inventory/template/get`,
    CONFIGURE_EQUIPMENT: "/api/configureEquipment",
    GET_CONNECTION_TEMPLATE: `${baseUrl}/inventory/template/ConnectionTemplate/get`,
    CREATE_EQUIPMENT: "/api/templateCreation",
    POST_VIRTUAL_CONNECTION: `${baseUrl}/inventory/v1/graph/create_relationship`,
    GET_NETWORK_CONNECTION: `${baseUrl}/inventory/network/getNetwork`,
    MAKE_CONNECTION: `${baseUrl}/inventory/createconnection/establish`,
    EDIT_TEMPLATE: `${baseUrl}/inventory/template/modifyTemplate`,
    CREATE_CONNECTION_TEMPLATE: `${baseUrl}/inventory/template/equipment/create`,
    RIP_REBUILD: `/api/RipRebuild`,
    RADIUS_IP: `/api/radiusIp`,
    GET_ACCOUNT: `${accountSearch}/c360/v1/graphql`,
    MODIFY_EQUIPMENT: `${baseUrl}/inventory/template/modifyEquipment`,
    GET_SERVICE_QUALIFICATION: `/api/getServiceQualification`,
    GET_ADDRESS_AVALAIBILITY: `${amsUrl}/ams2-digital/restservices/adq-api/v1/addressavalaibility`,
    MARK_PORT_AS_BAD: `${baseUrl}/inventory/v1/inventory/updateStatus`,
    GET_RADIUSADDRESS: `${radiusUrl}/radius-accounting/session`,
    CREATE_CPE_RULE: `/api/smartNid`,
    CPE_RULE_LIST: `/api/smartNid`,
    UPDATE_CPE_RULE: `/api/smartNid`,
    DELETE_CPE_RULE: `/api/smartNid`,
    GET_CPE_RULE_META: `/api/cpeMeta`,
    GET_SUBSCRIBER: `/api/getSubscriber`,
    GET_PROFILE: "/api/getProfileCredentials",
    CASE_QUERY_URL: `${baseUrl}/api/case/query`,
    GET_ONT_STATUS_URL: "/api/ont/status",
    SEARCH_NODE_PROP: `${baseUrl}/inventory/v1/inventory/searchByNodeProps`,
    CREATE_NODE_DROPTERMINAL: `api/createNode`,
    GET_IQGEO: `${baseUrl}/line-record-service/v3/nps/linerecord/address-id`,
  },
};
