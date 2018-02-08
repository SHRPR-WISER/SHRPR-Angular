import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { Course, CourseService } from '@app/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
  
})

export class HomeComponent implements OnInit {
  private subscriptions = new Subscription();
  width = document.documentElement.clientWidth;

  isheaderShrunk: boolean = false;
  groups = ['For Fun', 'For Work', 'For Kids'];
  
  constructor() {
      const $resizeEvent = Observable.fromEvent(window, 'resize')
      .map(() => {
        return document.documentElement.clientWidth;
        })
      
      this.subscriptions.add($resizeEvent.subscribe(data => {
        this.width = data;
      }));
  }

  ngOnInit() { }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }
}