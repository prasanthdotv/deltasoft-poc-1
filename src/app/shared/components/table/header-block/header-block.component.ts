import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header-block',
  templateUrl: './header-block.component.html',
  styleUrls: ['./header-block.component.scss']
})
export class HeaderBlockComponent implements OnInit {
  @Input() pageTitle: string;
  @Input() headerIconNeeded = false;
  @Output() iconClicked = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  onIconClick() {
    this.iconClicked.emit();
  }
}
