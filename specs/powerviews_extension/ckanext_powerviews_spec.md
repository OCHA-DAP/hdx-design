# 'Power Views' extension for CKAN

Data source and configuration to power a view for one or more resources.

The PowerView model is similar to the existing ResourceView, but can have a many-to-many relationship with Resources.

This document proposes an API for creating, updating, showing and deleting PowerViews, as well as listing PowerViews for a resource and visa versa.

This extension should support CKAN 2.3 (HDX currently runs on 2.3) and above.

<!-- MarkdownTOC depth=3 autolink=true bracket=round -->

- [Related Work](#related-work)
- [Proposal](#proposal)
    - [Database tables](#database-tables)
    - [API](#api)

<!-- /MarkdownTOC -->

## Related Work

ResourceViews have been part of CKAN core since version 2.3. That work resolved several issues around creating views for resources:

- Allow resources to have more than one view type
- Allow more than one view per resource
- Persist predefined view configuration
- A uniform way to embed previews in other sites with a particular configuration.

(More information about ResourceViews can be found in the [CKAN wiki](https://github.com/ckan/ckan/wiki/Resource-Views).)

During development of ResourceViews, a [use case was suggested](https://github.com/ckan/ckan/pull/1251#issuecomment-36668704) for a more general approach to views; one not tied to a single resource. Issues that would need to be resolved for such an implementation:

- identify and associate data sources with view
- identifying common fields on which to join separate data sources
- authorization for creating views from 'un-owned' data sources
- UI and place within the site hierarchy for view creation, listing and details pages when disassociated with resources


## Proposal

Instances of the PowerView model can be used by (PowerView supporting) view extensions to store references to the data sources and configured state for a view. Unlike the existing ResourceView, PowerViews can associate with more than one resource. 

Unlike ResourceViews, where instances are essentially a child of a single resource, PowerViews are intended to better enable views to be used outside of the resource page context, e.g. within thematic dashboards.

Examples of extensions that could make use of PowerViews are, a single map that renders separate layers for each resource, or a chart comparing the data of separate resources within the same rendering.

### Database tables

Similar to the existing ResourceView model, but the many-to-many relationship with resources is managed by a separate `powerview_resource_association` table.

#### `powerview` table
```
"id" text PRIMARY KEY
"title" text
"description" text  
"view_type" text NOT NULL  
"config" text -- (JSON)
```


#### `powerview_resource_association` table
```
resource_id text NOT NULL
powerview_id text NOT NULL
```

For these newly created tables, we should be mindful of concerns about the practise of 'auto-migrating' the database from extensions that has often been used in the past, and instead explicitly create new tables with a custom management command (see https://github.com/ckan/ideas-and-roadmap/issues/164 for more discussion).

### API

#### `ckanext_powerview_create`

Create a new PowerView. User must be authorized to create PowerViews.

##### Parameters: 
- title (string) title of the PowerView
- description (string) a description for the PowerView (optional)
- view_type (string) type of view
- resources (list of resource ids) resource ids available for this view
- config (JSON string) options necessary to recreate a view state (optional)

#### `ckanext_powerview_update`

Update an existing PowerView. User must be authorized to update PowerViews.

##### Parameters: 
- id (string) id of the view to update

See ckanext_powerview_create to other parameters.

#### `ckanext_powerview_show`

Return the metadata of a PowerView.

##### Parameters: 
- id (string) id of the view to show

##### Returns:
Dictionary of PowerView metadata.

#### `ckanext_powerview_delete`

Delete a PowerView. User must be authorized to delete PowerViews.

##### Parameters: 
- id (string) id of the view to delete

#### `ckanext_powerview_add_resource`

Add a resource to a PowerView (without having to update the whole PowerView dict).

##### Parameters:
- view_id (string) id of the PowerView to update
- resource_id (string) id of the Resource to add

#### `ckanext_powerview_remove_resource`

Remove a resource from a PowerView (without having to update the whole PowerView dict).

##### Parameters:
- view_id (string) id of the PowerView to update
- resource_id (string) id of the Resource to add

#### `ckanext_powerview_list_views_for_resource`

List PowerViews associated with a resource.

##### Parameters:
- id (string) id of the resource

##### Returns:
List of PowerView metadata dictionaries.

#### `ckanext_powerview_list_resources_for_view`

List resources associated with a PowerView.

##### Parameters:
- id (string) id of the PowerView

##### Returns:
List of resource dictionaries.
