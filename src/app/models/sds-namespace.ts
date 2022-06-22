/**
 * SDS Namespace representation, see
 * {@link https://docs.osisoft.com/bundle/data-hub/page/api-reference/tenant/tenant-namespaces.html|ADH Documentation},
 * EDS always contains two namespaces, 'default' and 'diagnostics'
 */
export interface SdsNamespace {
  Id: string;
  Name: string;
  Description: string;
  InstanceId: string;
  Region: string;
  Self: string;
}
