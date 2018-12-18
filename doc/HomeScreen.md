## General Design Considerations
**Question: Should this file be HomeScreenView.md or HomeScreen.md**

Here’s the when and why we use a Home Screen in simulation design

* Home Screen is not very customizable in terms of its presentation
* Needed when the simulation has more than one screen
* Acts as a landing screen, providing a very brief welcome and navigational access to each screen
* Presents the sim screens in a suggested exploration order
* Each screen is activated via a button represented by a visual image and visible label, the sim screen's name
* Contains a link to the PhET Menu

## Aesthetic Considerations
* List out any specific design considerations that are potentially useful for scaffolding new designers
* space
* order
* content in screen shots

## Accessibility Considerations
When designing the Home Screen please consider and provide drafts for the following:
* An action-oriented welcome phrase that indicates the name of the simulation and the number of screens it has. For example, 
  * > Come explore with Coulomb's Law. It has two interactive screens. 
  * > Come explore with Build an Atom. It has three interactive screens.
* Each sim screen will be access via a button containing the name of the screen. The button context will be provided automatically by the assistive technology. For example, the sim screen buttons for Coulomb's Law would typically sound like: 
  * > Atom Screen, button
  * > Symbol Screen, button
  * > Game Screen, button
* Each sim screen button needs a brief action-orientated sentence to go along with the screen name. You can think of this sentence as having an equivalent purpose as the visually inviting thumbnail on the actual button. It should encourage interaction and hint at what the student will do in that screen. The sentence may or may not be read out along with the screen button's name. The design intent, however, is that the description text would be read out automatically (Home Screen only) when the sim screen button receives keyboard focus. For example, on the Home Screen a sim screen button should sound like this: 
  * > Atom Screen, button. Explore what makes up an Atom.
  * > Symobol Screen, button. Investigate atoms and their atomic symbols.
  * > Game Screen, button. Test your knowledge of atoms and atomic symbols.
* The sim screen buttons function as navigation to the other screens. We communicate this automatically to users of assistive technology by ensuring the parent containing element has the _landmark role of navigation_. We do this in the code by using the html `nav` element.
* The sim screens have an optional, but suggested order. We can communicate this by using a ordered list, or `ol` element. The list would contain list items to wrap the sim screen buttons and their descriptions.
* Our sims are not like typical web pages that have a large amount of content and links to other documents. We have, however, found in interviews that users are surprised if they find no headings or no links when they first visit the simualtion. We do indeed use headings to structure the sim screen pages, but there is still an open question if we need H2 headings on the Home Screen. For now, I have included the headings that would also appear on the sim screen pages, "Sim Screens" and "Sim Resources." We will see how users responds to this structure.


### Gesture Support
ToDO.

### Keyboard Support
| Key        | Function |
| :--------- | :------- |
| Enter or Space | When focus is on a sim screen `button`, activates the screen, hiding the Home Screen and making visible the selected screen. Focus should be placed at the start of the sim screen on the `h1` of the active screen. |
| Tab | Moves focus to next next sim screen button on the home screen.  If last sim screen button, focus moves to the PhET Menu button, and then automatically to browser controls. |
| Shift Tab | Moves focus to previous sim screen button on the home screen. If no previous button, focus automatically goes to browser controls.|


### Management of Roles, States, Properties

| Role | Attribute | Element | Usage |
| :--- | :-------- | :------ | :---- |
| - | `aria-labelledby="[ID REF of h2]"`| `nav` | The `nav` element's native role is `navigation`, so their is no need to assign an explicit role of `navigation`. Role navigation is a `landmark region`, and assistive technologies typically provide shortcuts for landmarks. The `nav` element is named by the associated `h2` element. |
| - | `id="ID of h2"` | `h2` | Child element of the `nav` element. Provides a label for the _navigation region_ and potentially a reassuring heading to users of assistive technology. |
| - | - | `ol` | Parent container for the list items that contain the sim screen buttons and their associated descriptions. |
| - | - | `li` | Parent container for the screen button and its associated description. |
| - | `aria-describedby="[ID REF of p]"`| button | Element containing the screen name. The `button`'s label (i.e., its inner content) is the sim screen's name, and provides the accessible name for the sim screen button. The button is associated with its description via `aria-describedby` attribute containing the ID of description.|
| - | `id="ID of p"` | p | Element containing the sim screen's description. Is a sibling to the sim screen button, and child to the list item.


### Sample HTML for Home Screen and Sim Screens

#### Coulomb's Law Example (two screens) 
```html
<!-- Home Screen -->
<h1>Coulomb’s Law</h1> 
  <p>{{Come explore with}} {{Coulomb’s Law.}}. It has {{two}} interactive screens.</p>
  	
<!-- Screen buttons and their descriptions -->
<nav aria-lablledby="labelSimScreens">
  <h2 id="labelSimScreens">Sim Screens</h2>
  <ol>
    <li><button aria-describedby="descriptionScreen01">{{Macro Scale}} Screen</button>
		<p id="descriptionScreen01">{{Explore Coulomb’s Law on a macro scale}}.</p></li>
    <li><button aria-describedby="descriptionScreen02">{{Atomic Scale}} Screen</button>
		<p id="descriptionScreen02">{{Explore Coulomb’s Law at the atomic scale}}.</p></li>
  </ol>
</nav>
 
<!-- Section for Sim Resources, but no need for Keyboard Shortcuts on Home Screen -->
<section>
  <h2>Sim Resources</h2>
  <!-- contains PhET Button and access to PhET Menu -->
<section> 

<!-- Sim Screen 01 -->
<article>
  <h1>{{Macro Scale}} Screen, Coulomb’s Law</h1>
   <!-- Screen specific intro with Screen Parameters -->
   <p>The interactive {{Macro Scale}} Screen changes as you play with it. It has a Play Area and a Control Area. The Play Area has two charged spheres, Charge 1 (q1) and Charge 2 (q2), currently separated by {{distance}} centimeters. Each charge is held by a small robot. Spheres can be moved closer or further from one another, and the charge of each sphere can be increased or decreased. The Control Area has checkboxes to display forces or change to scientific notation, and a button to reset the sim.</p>
   <!-- Screen Specific Interaction Hint -->
   <p>{{Move spheres or change their charge to begin observations.}}</p>
   <!-- Common Keyboard Shortcuts Hint -->
   <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
  <h2>Play Area</h2>
    <!-- Stuff in the Play Area -->
  <h2>Control Area</h2>
    <!-- Stuff in the Control Area -->
</article>

<!-- Sim Screen 02 -->
<article>
  <h1>Atomic Scale Screen, Coulomb’s Law</h1>
    <!-- Screen specific intro with Screen Parameters -->
    <p>The interactive {{Atomic Scale}} Screen changes as you play with it. It has a Play Area and a Control Area. The Play Area has {{two charged particles, charge 1 (q1) and charge 2 (q2), currently separated by {{value}} picometers. Each particle is held by a microscopic robot. Particles can be moved closer or further from one another, and the charge of each particle can be increased or decreased}}. The Control Area has {{checkboxes to display forces or change to scientific notation,}} and a reset button to reset the sim.</p>
    <!-- Screen Specific Interaction Hint -->
    <p>{{Move particles or change their charge to begin observations.}}.</p>
    <!-- Common Keyboard Shortcuts Hint -->
    <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
  <h2>Play Area</h2>
    <!-- Stuff in the Play Area -->
  <h2>Control Area</h2>
    <!-- Stuff in the Control Area -->
</article>

<!-- Navigation landmark section for Sim Screens, that includes all relevant screen buttons -->
<nav aria-lablledby="labelSimScreens">
  <h2 id="labelSimScreens">Sim Screens</h2>
	 <!-- All relevant screen buttons without aria-describedby. -->
	 <ol>
       <li><button>{{Macro Scale}} Screen</button>
   		<p id="descriptionScreen01">{{Explore Coulomb’s Law on a macro scale}}.</p></li>
       <li><button>{{Atomic Scale}} Screen</button>
   		<p id="descriptionScreen02">{{Explore Coulomb’s Law at the atomic scale}}.</p></li>
	 </ol>
</nav>

<!-- Section for Sim Resources, that includes all relevant buttons -->
<section aria-labeledby="labelSimResources">
  <h2 id="labelSimResources">Sim Resources</h2>
  <!-- Mute Sound, Keyboard Shortcuts, PhET Menu  -->
<section>
```

#### Build and Atom Example (three screens)
```html
<!-- Home Screen -->
<h1>Build an Atom</h1> 
  <p>{{Come explore with}} {{Build an Atom}}. It has {{three}} interactive screens.</p>	

<!-- Sim Screen buttons and their descriptions -->
<nav aria-lablledby="labelSimScreens">
  <h2 id="labelSimScreens">Sim Screens</h2>
  <ol>
    <li><button aria-describedby="descriptionScreen01">{{Atom}} Screen</button>
  	  <p id="descriptionScreen01">{{Explore what makes up an atom}}.</p></li>
    <li><button aria-describedby="descriptionScreen02">{{Symbol}} Screen</button>
  	  <p id="descriptionScreen02">{{Investigate atoms and their atomic symbols}}.</p></li>
    <li><button aria-describedby="descriptionScreen03">{{Game}} Screen</button>
  	  <p id="descriptionScreen03">{{Test your knowledge of atoms and their atomic symbols}}.</p></li>
  </ol>
</nav> 

<!-- Section for Sim Resources, but no need for Keyboard Shortcuts on Home Screen -->
<section aria-lablledby="labelSimResources"> 
  <h2 id="labelSimResources">Sim Resources</h2>
  <!-- contains PhET Button and access to PhET Menu -->
<section> 

<!-- Sim Screen 01 -->	
<article>
  <h1>Atom Screen, Build an Atom</h1>
   <!-- Screen specific intro with Screen Parameters -->
   <p>The interactive {{Atom}} Screen changes as you play with it. It has a Play Area and a Control Area. The Play Area {{has a model of an atom called My Atom, three buckets of particles, and three detail panels that track important things about the atom}}. The Control Area has {{radio buttons to switch the Atom model, checkboxes to adjust what inforamtion is shown,}} and a reset button to reset the sim.</p>
   <!-- Screen Specific Interaction Hint -->
   <p>Look for particle buckets to play.</p>
   <!-- Common Keyboard Shortcuts Hint -->
   <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
  <h2>Play Area</h2>
    <!-- Stuff in the Play Area -->
  <h2>Control Area</h2>
    <!-- Stuff in the Control Area -->
</article> 

<!-- Sim Screen 02 -->
<article>
  <h1>Symbol Screen, Build an Atom</h1>
     <!-- Screen specific intro with Screen Parameters -->
     <p>The interactive {{Symbol}} Screen changes as you play with it. It has a Play Area and a Control Area. The Play Area has {{DESCRIPTION OF PLAY AREA}}. The Control Area has {{DESCRIPTION OF CONTROL AREA,}} and a reset button to reset the sim.</p>
     <!-- Screen Specific Interaction Hint -->
     <p>{{HINT FOR SYMBOL SCREEN}}.</p>
     <!-- Common Keyboard Shortcuts Hint -->
     <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
    <h2>Play Area</h2>
      <!-- Stuff in the Play Area -->
    <h2>Control Area</h2>
      <!-- Stuff in the Control Area -->
</article>

<!-- Sim Screen 03 -->
<article>
  <h1>Game Screen, Build an Atom</h1>
     <!-- Screen specific intro with Screen Parameters -->
     <p>The interactive {{Game}} Screen, there is {{DESCRIPTION OF GAME SCREEN}}.</p>
     <!-- Screen Specific Interaction Hint -->
     <p>{{HINT FOR a GAME SCREEN}}</p>
     <!-- Common Keyboard Shortcuts Hint -->
     <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
      <!-- Structure relevant to a Game Screen, not sure about this yet.-->
</article>

<!-- Navigation landmark section for Sim Screens, that includes all relevant screen buttons -->
<nav aria-lablledby="labelSimScreens">
  <h2 id="labelSimScreens">Sim Screens</h2>
	 <!-- All relevant screen buttons without aria-describedby. -->
	 <ol>
	   <li><button>{{Atom}} Screen</button>
		   <p id="descriptionScreen01">{{Explore what makes up an atom}}.</p></li>
	   <li><button>{{Symbol}} Screen</button>
		   <p id="descriptionScreen02">{{Investigate atoms and their atomic symbols}}.</p></li>
	   <li><button>{{Game}} Screen</button>
		   <p id="descriptionScreen03">{{Test your knowledge of atoms and their atomic symbols}}.</p></li>
	 </ol>
</nav>

<!-- Section for Sim Resources, that includes all relevant buttons -->
<section aria-labeledby="lableSimRsources">
  <h2 id="lableSimRsources">Sim Resources</h2>
  <!-- Mute Sound, Keyboard Shortcuts, PhET Menu  -->
<section>
```

#### Generic Example (three screens including a game screen)
```html
<!-- Home Screen -->
<h1>{{SimName}}</h1> 
  <p>{{GeneralActionPhrase}} {{SimName}}. It has {{NumScreens}} interactive screens.</p>	

<!-- List screen buttons and their descriptions -->
  <nav aria-lablledby="simScreensLabel">
  <h2 id="simScreensLabel">Sim Screens</h2>
	<ol>
  	  <li><button aria-describedby="descriptionScreen01">{{ScreenName01}} Screen</button>
		  <p id="descriptionScreen01">{{ActionPhraseForScreen01}}.</p></li>
  	  <li><button aria-describedby="descriptionScreen02">{{ScreenName02}} Screen</button>
		  <p id="descriptionScreen02">{{ActionPhraseForScreen02}}.</p></li>
  	  <li><button aria-describedby="descriptionScreen03">{{GameScreenName}} Screen</button>
		  <p id="descriptionScreen03">{{ActionPhraseForGameScreenName}}.</p></li>
  	</ol>
  </nav>
  
<!-- Section for Sim Resources -->
<section aria-lablledby="simResourcesLabel">
  <h2 id="simResourcesLabel">Sim Resources</h2>
  <!-- contains PhET Menu Button only -->
<section>

<!-- Sim Screen 01 -->
<article>
  <h1>{{ScreenName01}} Screen, {{SimName}}</h1>
   <!-- Screen specific intro with Screen Parameters -->
   <p>The interactive {{ScreenName01}} Screen changes as you play with it. It has a Play Area and a Control Area. The Play Area {{DESCRIPTION OF PLAY AREA FOR SCREEN 01}}. The Control Area has {{DESCRIPTION OF CONTROL AREA FOR SCREEN 01,}} and a reset button to reset the sim.</p>
   <!-- Screen Specific Interaction Hint -->
   <p>{{HINT FOR SCREEN 01}}</p>
   <!-- Common Keyboard Shortcuts Hint -->
   <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
  <h2>Play Area</h2>
    <!-- Stuff in the Play Area -->
  <h2>Control Area</h2>
    <!-- Stuff in the Control Area -->
</article> 

<!-- Sim Screen 02 -->
<article>
  <h1>{{ScreenName02}} Screen, {{SimName}}</h1>
     <!-- Screen specific intro with Screen Parameters -->
     <p>The interactive {{ScreenName02}} Screen changes as you play with it. It has a Play Area and a Control Area. The Play Area has {{DESCRIPTION OF PLAY AREA FOR SCREEN 02}}. The Control Area has {{DESCRIPTION OF CONTROL AREA FOR SCREEN 02,}} and a reset button to reset the sim.</p>
     <!-- Screen Specific Interaction Hint -->
     <p>{{HINT FOR SCREEN 02}}.</p>
     <!-- Common Keyboard Shortcuts Hint -->
     <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
    <h2>Play Area</h2>
      <!-- Stuff in the Play Area -->
    <h2>Control Area</h2>
      <!-- Stuff in the Control Area -->
</article>

<!-- Sim Screen 03 -->
<article>
  <h1>{{GameScreenName}}, {{SimName}}</h1>
     <!-- Screen specific intro with Screen Parameters -->
     <p>On the interactive {{GameScreenName}} Screen, there is {{DESCRIPTION OF GAME SCREEN}}.</p>
     <!-- Screen Specific Interaction Hint -->
     <p>{{HINT FOR a GAME SCREEN}}</p>
     <!-- Common Keyboard Shortcuts Hint -->
     <p>If needed, check out keyboard shortcuts under Sim Resources.</p>
      <!-- Structure relevant to a Game Screen, not sure about this yet.-->
</article>

<!-- Navigation landmark section for Sim Screens, that includes all relevant screen buttons -->
<nav aria-lablledby="lableSimScreens">
  <h2 id="labelSimScreens">Sim Screens</h2>
	 <!-- All relevant screen buttons without aria-describedby. -->
	 <ol>
   	  <li><button>{{ScreenName01}} Screen</button>
 		  <p id="descriptionScreen01">{{ActionPhraseForScreen01}}.</p></li>
   	  <li><button>{{ScreenName02}} Screen</button>
 		  <p id="descriptionScreen02">{{ActionPhraseForScreen02}}.</p></li>
   	  <li><button>{{ScreenName03}} Screen</button>
 		  <p id="descriptionScreen03">{{ActionPhraseForScreen03}}.</p></li>
	 </ol>
</nav>

<!-- Section for Sim Resources, that includes all relevant buttons -->
<section aria-labeledby="simResourcesLabel">
  <h2 id="simResourcesLabel">Sim Resources</h2>
  <!-- Mute Sound, Keyboard Shortcuts, PhET Menu  -->
<section>
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



