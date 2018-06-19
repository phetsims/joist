## General Design Considerations

Here’s the when and why we use a Home Screen in simulation design
* Home Screen View.md
* Home screen is not very customizable in terms of its presentation
* Needed when the simulation has more than one screen
* Acts as a landing or welcoming screen, very briefly introducing the simulation and each of its screens
* Provides navigation to the sims screens in a suggested exploration order
* Contains a link to the PhET Menu

## Aesthetic Considerations
* List out any specific design considerations, e.g., space
* Potentially useful for scaffolding new designers
* order
* content in screen shots

## Accessibility Considerations
* List out any design considerations that impact accessible design, e.g., visibility of content, special keyboard focus highlights, etc.
* Very brief welcome sentence that indicates the number of screen for the simulation. For example, 
  * "Come explore with Build an Atom. It has three screens." 
* Each screen will be access via a button containing the name of the screen. The button context will be provided automatically by the assitive technology. For example, the screen button for Build and Atom would sound like: 
  * Atom Screen, button
  * Symbol Screen, button
  * Game Screen, button
* Each screen button needs a brief action-orientated sentence to go along with the screen name. You can think of this sentence as having an equivalent purpose as the visually inviting thumbnail. It should encourage interaction and hint out what the student wil do in that screen. The sentence will be read out along with the screen name provided on the button. For example, together the screen buttons and their description could sound like this: 
  * Atom Screen, button. Explore what makes up an Atom.
  * Symobol Screen, button. Investigate atoms and their atomic symbols.
  * Game Screen, button. Test your knowledge of atoms and atomic symbols.
* The screen buttons function as navigation to the other screens. We can communicate this through the use of the navigation role by using the `nav` element.
* The sim screens have an optional, but suggested order. We can communicate this by using a ordered list, or `ol` element. The list would contain list items to wrap the screen buttons and their descriptions


### Gesture Support
ToDO.

### Keyboard Support
| Key        | Function |
| ------------- |-------------|
| Enter or Space | When focus is on a button, activates the button, hiding the Home Screen and making visible the selected screen. Focus should be placed at the start of the screen on the h1 of the screen. |
| Tab | Moves focus to next focusable item, e.g. next button on the home screen.  If last focusable ite, focus automatically goes to browser controls. |
| Shift Tab | Moves focus to previous focusable item, e.g. previous button on the home screen. If no previous item, focus automatically goes to browser controls.|
| ------------- |-------------|


### Management of Role, Property, State, and Tabindex Attributes

| Role | Attribute | Element | Usage |
| ---- |-----------| ------- |-------|
| --- |----------- | `nav` | The `nav` element's native role is `navigation`, so their is not need to assign an explicit role of `navigation`. Role navigation is a `landmark region`, and assistive technologies typically provide short cuts for landmarks. |
| ------------- |-------------| ol | Parent container for the list items that contain the screen buttons and descriptions. |
| ------------- |-------------| li | Parent container for the sreen button and its description. |
| ------------- |aria-describedby="[ID REF of P]"| button | Element containing the screen name. Each button will need an accessible name provided by the button's label (i.e., the button's inner content).|
| ------------- |-------------| p | Element containing the sim screen's description. Is a sibling to the sim screen button, and child to the list item.
| ---- |-----------| ------- |-------|


### Sample HTML for Sim title and Screen buttons

#### Build and Atom Example
```html

<h1>Build an Atom</h1> 
<p>{{Come explore with}} {{Build an Atom}}. It has {{three}} interactive screens.</p>	
<!-- Screen buttons and their descriptions -->
  <nav aria-label="Sim Screens">
	<ol>
  	  <li><button aria-describedby="screen01-description">{{Atom}} Screen</button>
	   	<p id="screen01-description">{{Explore}} {{what makes up an atom}}.</p></li>
  	  <li><button aria-describedby="screen02-description">{{Symbol}} Screen</button>
	  	<p id="screen02-description">{{Investigate}} {{atoms and their atomic symbols}}.</p></li>
  	  <li><button aria-describedby="screen03-description">{{Game}} Screen</button>
	  	<p id="screen03-description">{{Test your knowledge}} {{of atoms and their atomic symbols}}.</p></li>
  	</ol>
  </nav> 
 <!-- Section for Sim Resources, but no need for Keyboard Shortcuts on Home Screen -->
 <section>
	 <h2>Sim Resources</h2>
 <!-- contains PhET Button and access to PhET Menu -->
 <section>
	 
<article>
  <h1>Atom Screen, Build an Atom</h1>
   <!-- Screen specific intro with Screen Parameters -->
   <p>This is an interactive sim. {{The screen}} changes as you play with it. {{Each screen}} has a Play Area and a Control Area. The Play Area for {{this screen/ the Atom Screen}} {{has a model of an atom called My Atom, three buckets of particles, and three detail panels that track important things about the atom}}. The Control Area has {{radio buttons to switch the Atom model, checkboxes to adjust what inforamtion is shown}}, and a reset button to reset the sim and begin again}}.</p>
   <!-- Screen Specific Interaction Hint -->
   <p>Look for particle buckets to play.</p>
   <!-- Common Keyboard Shortcuts Hint -->
   <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
  <h2>Play Area</h2>
    <!-- Stuff in the Play Area -->
  <h2>Control Area</h2>
    <!-- Stuff in the Controls Area -->
</article>

<article>
  <h1>Symbol Screen, Build an Atom</h1>
     <!-- Screen specific intro with Screen Parameters -->
     <p>The interactive {{Symbol Screen}} changes as you play with it. It has a Play Area and a Control Area. The Play Area has {{DESCRIPTION OF PLAY AREA}}. The Control Area has {{DESCRIPTION OF CONTROL AREA}}, and a reset button to reset the sim and begin again}}.</p>
     <!-- Screen Specific Interaction Hint -->
     <p>{{HINT FOR SYMBOL SCREEN}}.</p>
     <!-- Common Keyboard Shortcuts Hint -->
     <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
    <h2>Play Area</h2>
      <!-- Stuff in the Play Area -->
    <h2>Control Area</h2>
      <!-- Stuff in the Control Area -->
</article>

<article>
  <h1>Game Screen, Build an Atom</h1>
     <!-- Screen specific intro with Screen Parameters -->
     <p>The interactive {{Game Screen}}, there is {{DESCRIPTION OF GAME SCREEN}}.</p>
     <!-- Screen Specific Interaction Hint -->
     <p>{{HINT FOR GAME SCREEN}}</p>
     <!-- Common Keyboard Shortcuts Hint -->
     <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
    <h2>Play Area</h2>
      <!-- Stuff in Play Area if Game Screen has a Play Area? -->
    <h2>Control Area</h2>
      <!-- Stuff in Control Area if Game Screen has a Control Area?-->
</article>
```

#### Generic Example
```html
<h1>Name of Sim</h1> 
<p>{{ActionPhraseGeneral}} {{NameOfSimulation}}. It has {{NumScreens}} screens.</p>	
<!-- List screen buttons and their descriptions -->
  <nav aria-label="Sim Screens">
	<ol>
  	  <li><button aria-describedby="screen01-description">{{ScreenName01}} Screen</button>
	   	<p id="screen01-description">{{ActionPhrase01}} {{X}}.</p></li>
  	  <li><button aria-describedby="screen02-description">{{ScreenName02}} Screen</button>
	  	<p id="screen02-description">{{ActionPhrase02}} {{Y}}.</p></li>
  	  <li><button aria-describedby="screen03-description">{{ScreenName03}} Screen</button>
	  	<p id="screen03-description">{{ActionPhrase03}} {{X}} and {{Y}}.</p></li>
  	</ol>
  </nav>

```
### Sample HTML for PhET Menu button
Likely needs a seperate MD file. (PhetButton or PhetMenu ??)
- ToDo: double check the labeling technique for the menu context, ie., `aria-label="Teacher tools and links"`

```html
	    <!-- PhET Menu button activates PhET Menu -->
	    <div class="menu-wrapper" aria-label="Teacher tools and links">
	      <button
	            aria-haspopup="true"
	            aria-controls="phet-menu">PhET Menu</button>
	      <ul role="menu" id="phet-menu">
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
	  </div><!-- end menu-wrapper -->

```

### Supporting Accessibility Resources
* [ARIA Practices 1.1, section 3.5 Button](https://www.w3.org/TR/wai-aria-practices/#button)
* [ARIA 1.1 aria-haspopup property](https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup)

### Design Doc Content Template Text
**Home Screen**
Simulation name: defaults to h1 element
Home screen intro sentence: defaults to p element

**Screen Buttons and Descriptions**
Screen 1 name:
Screen 1 description:

Screen 2 name:
Screen 3 description:

Screen 3 name:
Screen 3 description:

etc.



