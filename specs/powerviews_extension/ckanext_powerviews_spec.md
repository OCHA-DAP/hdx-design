# 'Power Views' extension for CKAN

PowerView object is a collection of Datasets and configuration...

This extension should support CKAN 2.3 (HDX currently runs on 2.3) and above.

<!-- MarkdownTOC depth=3 autolink=true bracket=round -->

- [Proposal](#proposal)
- [Pages](#pages)
    - [Create/Update PowerView](#createupdate-powerview)
    - [Detail](#detail)
    - [List](#list)
    - [List tab (within dataset pages)](#list-tab-within-dataset-pages)
    - [PowerView config page](#powerview-config-page)
- [Roles](#roles)
    - [PowerView administrator](#powerview-administrator)
    - [Site Visitor / Data User](#site-visitor--data-user)
    - [Site Maintainer / Sysadmin](#site-maintainer--sysadmin)

<!-- /MarkdownTOC -->


## Proposal

The new 'PowerView' object type is a top-level, first-order navigation item (like Organizations and Groups), with the following fields and features:

Fields:
- Title
- URL
- Tags
- Description
- Image URL / Logo - a cover image
- Author / Owner / Maintainer
- JSON field - to hold configuration data for the view

Features:
- Share
- Follow 
- Tools to manage a collection of datasets

We'll take cues from the way [ckanext-showcase](https://github.com/ckan/ckanext-showcase) represents and manages a collection of datasets. 

Like ckanext-showcase, I propose we use a custom dataset type to build out the new top-level PowerView object. This affords us important features within CKAN, such as tagging, following, and adding fields to the Solr search index. Where customisation needs to be made to the dataset schema we can use [ckanext-scheming](https://github.com/ckan/ckanext-scheming).

New database tables will need to be created to manage the association between the PowerView object and its dataset collection, and for PowerView admins. We should be mindful of concerns about the practise of 'auto-migrating' that has often been used in the past to handle the creation of these tables, and instead explicitly create new tables with a custom management command (see https://github.com/ckan/ideas-and-roadmap/issues/164 for more discussion).

We should also be mindful of not having ForeignKey constraints to core tables. See how ckanext-issues handles it: https://github.com/ckan/ckanext-issues/blob/master/ckanext/issues/model/__init__.py#L516

The extension should be 'translations-ready', by implementing the [iTranslations extension interface](http://docs.ckan.org/en/ckan-2.5.1/extensions/translating-extensions.html#the-itranslation-interface) and marking strings for translation.


## Pages

### Create/Update PowerView

Creating a PowerView is a two-step process: Adding PowerView metadata, and managing a collection of datasets.

1\. Create and edit a PowerView and update its metadata fields

![Create Power View](http://cl.ly/fMC7/power_view-create.png)

2\. Manage dataset collection associated with PowerView
    + Search for and add datasets to a PowerView from PowerView admin page
    + Remove datasets from a PowerView from PowerView admin page

User must be have required permissions to be able to create and update PowerViews.

![Manage datasets](http://cl.ly/fM8C/power_view-manage_datasets.png)

### Detail

A page showing a PowerView's metadata and its view representation (a map, or chart, etc) based on its dataset collection and configuration JSON data.

The PowerView detail page will also feature user controls for following and sharing.

### List

A top-level page listing PowerViews providing faceted search (by tag and text). Listed PowerView items will be displayed with title, cover image, short description text, and display the number of datasets in the PowerView's collection.

![List page](http://cl.ly/fMHE/power_view-list_page.png)

### List tab (within dataset pages)

A tab within a dataset listing the PowerViews that the dataset is a member of. We may also want to provide features to add and remove the dataset to an existing PowerView collection from this page:

- Add dataset to an existing PowerView from dataset admin page
- Remove dataset from an existing PowerView from dataset admin page

![List tab in dataset](http://cl.ly/fMAF/power_view-list_in_dataset.png)

### PowerView config page

A config tab within the CKAN admin section to add and remove users from the PowerView admin role.

User must be a sysadmin to be able to use the PowerView config page.

![PowerView admin config](http://cl.ly/fM7I/power_view-admin.png)

## Roles

### PowerView administrator

- Is able to create and configure PowerView objects from publicly published datasets.

### Site Visitor / Data User

- Is able to search for and view PowerViews.
- Is able to discover what PowerViews a dataset is a member of.

### Site Maintainer / Sysadmin

- Is able to appoint users to the role of PowerView administrator.
