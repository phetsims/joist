## General Design Considerations
ToDo
* Here’s the when and why we use {{PhetMenu and PhetButton}} in simulation design.
* PhET Menu Button is the last item in the simulation


## Aesthetic Considerations
ToDo
* List out any specific design considerations, e.g., space
* **Note** that the JS files lists out how the design constraints are handled.

## Accessibility Considerations
ToDo
* List out any design considerations that impact accessible design, e.g., visibility of content, special keyboard focus highlights, etc.


### Gesture Support
ToDo

### Keyboard Support
ToDo
| Key        | Function |
| ------------- |-------------|


### Management of Role, Property, State, and Tabindex Attributes
ToDo
| Role | Attribute | Element | Usage |
| ------------- |-------------| ------------- |-------------|



### Sample HTML for PhET Menu and PhET button
This HTML smaple combines both the [PhetButton.js](../js/PhetButton.js) and [PhetMenu.js](../js/PhetMenu.js) interactions.
```html
	    <!-- PhetMenu and PhetButton Wrapper-->
	    <div class="phetMenuWrapper" aria-label="Teacher tools and links">
	      <!-- PhetButton -->
		  <button
	            aria-haspopup="true"
	            aria-controls="phetMenu">PhET Menu</button>
		 <!-- end Phet button activates PhET Menu -->
		 <!-- PhetMenu -->
	      <ul role="menu" id="phetMenu">
	        <li role="menuitem">
	          View Options
	        </li>
	        <li role="menuitem">
	          Check for Updates
	        </li>
	        <li role="menuitem">
	          Take Screenshot
	        </li>
	        <li role="menuitem">
	          Full Screen
	        </li>
	        <li role="menuitem">
	          <a href="https://phet.colorado.edu/files/troubleshooting/?BIG-LONG-LINK">Report Problem</a>
	   	    </li>
	   	    <li role="menuitem">
	   	      About this Sim
	   	    </li>
	   	    <li role="menuitem">
	   	      <a href="http://phet.colorado.edu/">PhET Website</a>
	   	    </li>
	   	  </ul>
		  <!-- end PhetMenu -->
	  </div><!-- end phetMenuWrapper -->

```
### Supporting Accessibility Resources
* Adapted from [ARIA Practices]()

### Design Doc Content Template Text
**PhetButton and PhetMenu**
Same pattern in all sims


