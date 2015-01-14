# GoogleSuggest
A jQuery / Zepto plugin to get input suggestions from Google

### Installation
#### NPM
```
npm install googlesuggest
```
#### Bower
```
bower install googlesuggest
```


### Supported Elements
The following types of input fields are supported:
* text
* email
* tel
* url
* search

### Usage
$('input[type=text]').googleSuggest({
    menuClass: 'dropdown',
    itemHighlightedClass: 'dropdown-highlighted'',
    maxItemCount: 10
});

### Options
* menuContainer - Optional. The container to host the suggestion menu. If not specfied, the parent of the input field will be used.
* menuClass - Optional. The css class of the menu.
* itemClass - Optional. The css class of the menu item.
* itemHighlightedClass - Required. The css class of the highlighted menu item.
* interval - Optional, Default: 100, Unit: ms. The interval of detecting the change of the input field.
* maxItemCount - Optional, Default: 5. The maximum number of candidates to display.

 
### License
MIT