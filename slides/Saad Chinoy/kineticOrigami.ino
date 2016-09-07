/* 
 2 - button direction control of servo. Rotates 45 degrees in each direction on button press. returns to center when button is released.

 Based on 
 Controlling a servo position using a potentiometer (variable resistor) 
 by Michal Rinott <http://people.interaction-ivrea.it/m.rinott> 

 modified on 8 Nov 2013
 by Scott Fitzgerald
 http://arduino.cc/en/Tutorial/Knob
*/

#include <Servo.h>

Servo myservo;  // create servo object to control a servo

int leftButton = 0;  // left button
int rightButton = 1; //right button 
int servoPin = 9;
int left = 0;    // variable to read the value from the analog pin
int right = 0;
int pos = 45; //HOME position
int lastpos = 0;

boolean initFlag = false;

void setup()
{
  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  myservo.attach(servoPin);
  if(!initFlag)
  {
    initSweep();
    initFlag = true;
  }
  //Serial.begin(9600);
}

void loop() 
{ 
  
  left = analogRead(A0); //
  right = analogRead(A1); //
  lastpos= myservo.read();
  //Serial.println(myservo.read());
  
  if(left == 0)
  {
    for(pos = lastpos; pos < 90; pos += 1)  // goes from 0 degrees to 180 degrees 
    {                                  // in steps of 1 degree 
      myservo.write(pos);              // tell servo to go to position in variable 'pos' 
      delay(15);                       // waits 15ms for the servo to reach the position 
    } 
  }
  else if(right == 0)
  {
     for(pos = lastpos; pos>0; pos -= 1)     // goes from 180 degrees to 0 degrees 
     {                                
      myservo.write(pos);              // tell servo to go to position in variable 'pos' 
      delay(15);                       // waits 15ms for the servo to reach the position 
     } 
  }
  else
  {
    if(lastpos > 45){
      for(pos = lastpos; pos>=45; pos -= 1)
      {
         myservo.write(pos);              // tell servo to go to position in variable 'pos' 
      delay(15);
      }
    }
    else{
      for(pos = lastpos; pos<=45; pos += 1)
      {
         myservo.write(pos);              // tell servo to go to position in variable 'pos' 
      delay(15);
      } 
     } 
    }
} 

void initSweep()
{
  myservo.write(0);  // initializes servo at angle 0
  for(pos = 0; pos <= 90; pos += 1)     // goes from 90 degrees to 0 degrees 
     {                                
      myservo.write(pos);              // tell servo to go to position in variable 'pos' 
      delay(15);                       // waits 15ms for the servo to reach the position 
     }
}


