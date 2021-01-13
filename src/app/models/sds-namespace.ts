/**
 * SDS Namespace representation, see
 * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/Management/Account_Namespace_1.html|OCS Documentation},
 * EDS always contains two namespaces, 'default' and 'diagnostics'
 */
export interface SdsNamespace {
  Id: string;
  Description: string;
  InstanceId: string;
  Region: string;
  Self: string;
}
