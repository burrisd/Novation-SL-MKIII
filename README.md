# Novation-SL-MKIII
Cubase MIDI Remote script for Novation SL MKIII keyboard controller.

Presently this is an early modification of a sample project included in Cubase 12, 
serving as a proof of concept. Work is in progress and is an early prerelease of the driver.

Much of the focus so far has been to expand very limited functionality to include access to 
the LCD displays and LEDs, as well as lay groundwork toward a viable driver. There has been 
significant refactoring to reorganize the logic and add comments. A large portion of the early 
work is to establish a framework, assist in understanding the API, and illustrate how this driver
can implement the InControl mode of the Novation SL MKIII.

As an early adopter, you should be realistic about functionality and frequent changes and updates.

Some short-term goals for this project are:
  - Show proof of concept.
  - Bridge a gap in interfacing the SL MKIII controller with Cubase 12.
  - Move toward a data-driven design, allowing for simpler adoption and modification.
  - Act as a learning tool that can be used as a sample for your own work with other controllers.

You should also understand that the MIDI Remote API was just introduced into Cubase 12 and subject
to potential changes in design from the vendors. The goal is to be able to respond to these changes
in a timely fashion, however you should be prepared for disruptions and design changes.

The bonus for you is that you can participate in the direction of the project. That's not to say everyone
will get what they want. Even if you ultimately decide to do your own approach, there will be invaluable
assistance in reviewing how this driver works with the Remote API.
